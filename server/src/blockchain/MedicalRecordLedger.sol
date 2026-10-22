// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalRecordLedger {
    struct HashVersion {
        bytes32 recordHash;
        uint256 timestamp;
        address storedBy;
    }

    mapping(string => HashVersion[]) private recordHistory;

    event RecordHashStored(
        string indexed recordId,
        bytes32 indexed recordHash,
        uint256 timestamp,
        address indexed storedBy,
        uint256 version
    );

    // =====================================================
    // STORE MEDICAL RECORD HASH
    // =====================================================

    function addRecordHash(
        string memory recordId,
        bytes32 recordHash
    ) public {
        require(
            bytes(recordId).length > 0,
            "Record ID is required"
        );

        require(
            recordHash != bytes32(0),
            "Invalid record hash"
        );

        recordHistory[recordId].push(
            HashVersion({
                recordHash: recordHash,
                timestamp: block.timestamp,
                storedBy: msg.sender
            })
        );

        emit RecordHashStored(
            recordId,
            recordHash,
            block.timestamp,
            msg.sender,
            recordHistory[recordId].length
        );
    }

    // =====================================================
    // GET LATEST HASH
    // =====================================================

    function getLatestRecordHash(
        string memory recordId
    )
        public
        view
        returns (
            bytes32 recordHash,
            uint256 timestamp,
            address storedBy,
            uint256 versionCount
        )
    {
        uint256 count =
            recordHistory[recordId].length;

        if (count == 0) {
            return (
                bytes32(0),
                0,
                address(0),
                0
            );
        }

        HashVersion memory latest =
            recordHistory[recordId][
                count - 1
            ];

        return (
            latest.recordHash,
            latest.timestamp,
            latest.storedBy,
            count
        );
    }

    // =====================================================
    // GET VERSION COUNT
    // =====================================================

    function getRecordVersionCount(
        string memory recordId
    )
        public
        view
        returns (uint256)
    {
        return
            recordHistory[recordId]
                .length;
    }

    // =====================================================
    // GET SPECIFIC VERSION
    // =====================================================

    function getRecordVersion(
        string memory recordId,
        uint256 index
    )
        public
        view
        returns (
            bytes32 recordHash,
            uint256 timestamp,
            address storedBy
        )
    {
        require(
            index <
                recordHistory[recordId]
                    .length,
            "Version not found"
        );

        HashVersion memory version =
            recordHistory[recordId][
                index
            ];

        return (
            version.recordHash,
            version.timestamp,
            version.storedBy
        );
    }
}