package com.peerreview.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.Reader;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Component
@ConditionalOnProperty(name = "app.migrate-h2-to-mysql", havingValue = "true")
public class H2ToMySqlMigration implements ApplicationRunner {
    private static final List<String> TABLES =
            List.of("users", "submissions", "reviews", "comments", "notifications");

    private final DataSource mysqlDataSource;

    @Value("${H2_DATABASE_URL:jdbc:h2:file:./data/peer_review_db;DB_CLOSE_ON_EXIT=FALSE;MODE=MySQL}")
    private String h2Url;

    public H2ToMySqlMigration(DataSource mysqlDataSource) {
        this.mysqlDataSource = mysqlDataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection h2 = DriverManager.getConnection(h2Url, "sa", "");
             Connection mysql = mysqlDataSource.getConnection()) {
            verifySourceAndDestination(h2, mysql);
            mysql.setAutoCommit(false);

            try (Statement statement = mysql.createStatement()) {
                statement.execute("SET FOREIGN_KEY_CHECKS=0");
                for (String table : TABLES) {
                    int copied = copyTable(h2, mysql, table);
                    System.out.printf("Migrated %d rows from %s.%n", copied, table);
                }
                statement.execute("SET FOREIGN_KEY_CHECKS=1");
                mysql.commit();
            } catch (Exception exception) {
                mysql.rollback();
                throw exception;
            }
        }
        System.out.println("H2 to MySQL migration completed.");
    }

    private static void verifySourceAndDestination(Connection h2, Connection mysql) throws SQLException {
        DatabaseMetaData h2Metadata = h2.getMetaData();
        DatabaseMetaData mysqlMetadata = mysql.getMetaData();

        for (String table : TABLES) {
            if (!tableExists(h2Metadata, table)) {
                throw new SQLException("Expected H2 table is missing: " + table);
            }
            if (!tableExists(mysqlMetadata, table)) {
                throw new SQLException("Expected MySQL table is missing: " + table);
            }
            try (Statement statement = mysql.createStatement();
                 ResultSet result = statement.executeQuery("SELECT COUNT(*) FROM " + quoteMysql(table))) {
                result.next();
                if (result.getLong(1) != 0) {
                    throw new SQLException("MySQL table is not empty; refusing to overwrite " + table);
                }
            }
        }
    }

    private static boolean tableExists(DatabaseMetaData metadata, String expectedName) throws SQLException {
        try (ResultSet tables = metadata.getTables(null, null, "%", new String[]{"TABLE"})) {
            while (tables.next()) {
                if (expectedName.equalsIgnoreCase(tables.getString("TABLE_NAME"))) {
                    return true;
                }
            }
        }
        return false;
    }

    private static int copyTable(Connection h2, Connection mysql, String table) throws SQLException {
        List<String> sourceColumns = new ArrayList<>();
        Set<String> mysqlColumns = new HashSet<>();

        try (ResultSet columns = h2.getMetaData().getColumns(null, null, "%", "%")) {
            while (columns.next()) {
                if (table.equalsIgnoreCase(columns.getString("TABLE_NAME"))) {
                    sourceColumns.add(columns.getString("COLUMN_NAME"));
                }
            }
        }
        try (ResultSet columns = mysql.getMetaData().getColumns(mysql.getCatalog(), null, table, "%")) {
            while (columns.next()) {
                mysqlColumns.add(columns.getString("COLUMN_NAME").toLowerCase(Locale.ROOT));
            }
        }
        if (sourceColumns.isEmpty()) {
            throw new SQLException("No columns found in H2 table " + table);
        }
        for (String column : sourceColumns) {
            if (!mysqlColumns.contains(column.toLowerCase(Locale.ROOT))) {
                throw new SQLException("MySQL table " + table + " is missing column " + column);
            }
        }

        String selectSql = "SELECT * FROM " + quoteH2(table);
        String columnList = String.join(", ", sourceColumns.stream().map(H2ToMySqlMigration::quoteMysql).toList());
        String placeholders = String.join(", ", sourceColumns.stream().map(column -> "?").toList());
        String insertSql = "INSERT INTO " + quoteMysql(table) + " (" + columnList + ") VALUES (" + placeholders + ")";
        int copied = 0;

        try (Statement select = h2.createStatement();
             ResultSet rows = select.executeQuery(selectSql);
             PreparedStatement insert = mysql.prepareStatement(insertSql)) {
            while (rows.next()) {
                for (int index = 0; index < sourceColumns.size(); index++) {
                    Object value = rows.getObject(index + 1);
                    if (value instanceof java.sql.Clob clob) {
                        value = readClob(clob);
                    }
                    insert.setObject(index + 1, value);
                }
                insert.executeUpdate();
                copied++;
            }
        }
        try (Statement statement = mysql.createStatement();
             ResultSet result = statement.executeQuery("SELECT COUNT(*) FROM " + quoteMysql(table))) {
            result.next();
            if (result.getInt(1) != copied) {
                throw new SQLException("Row count verification failed for " + table);
            }
        }
        return copied;
    }

    private static String readClob(java.sql.Clob clob) throws SQLException {
        long length = clob.length();
        if (length > Integer.MAX_VALUE) {
            throw new SQLException("H2 CLOB is too large to migrate safely.");
        }
        try (Reader reader = clob.getCharacterStream()) {
            StringBuilder value = new StringBuilder((int) length);
            char[] buffer = new char[8192];
            int count;
            while ((count = reader.read(buffer)) != -1) {
                value.append(buffer, 0, count);
            }
            return value.toString();
        } catch (java.io.IOException exception) {
            throw new SQLException("Could not read an H2 CLOB.", exception);
        }
    }

    private static String quoteH2(String identifier) {
        String normalized = identifier.toUpperCase(Locale.ROOT);
        return "\"" + normalized.replace("\"", "\"\"") + "\"";
    }

    private static String quoteMysql(String identifier) {
        return "`" + identifier.replace("`", "``") + "`";
    }
}
