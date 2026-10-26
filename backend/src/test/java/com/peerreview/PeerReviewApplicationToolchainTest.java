package com.peerreview;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.InputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class PeerReviewApplicationToolchainTest {

    @Test
    void applicationBytecodeTargetsJava25() throws IOException {
        try (InputStream classFile =
                     PeerReviewApplication.class.getResourceAsStream("PeerReviewApplication.class")) {
            assertNotNull(classFile, "Application class file should be present");
            byte[] header = classFile.readNBytes(8);
            assertEquals(8, header.length, "Class file header should be complete");
            int majorVersion = ((header[6] & 0xff) << 8) | (header[7] & 0xff);
            assertEquals(69, majorVersion, "Java 25 class files use class-file major version 69");
        }
    }
}
