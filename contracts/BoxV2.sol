pragma solidity ^0.8.2;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BoxV2 is Initializable{
    uint256 public x;
    uint256 public y;

    function initialize(uint256 _x) public initializer {
        x = _x;
        y = 55;
    }

    function setY(uint256 _y) public {
        y = _y;
    }

}