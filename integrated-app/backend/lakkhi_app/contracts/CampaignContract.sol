// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CampaignContract is Ownable, Pausable {
    // Token name could be stored here for reference purposes:
    // string public tokenName; // e.g. "USD Coin"
    
    // Campaign ID could be stored here to link on-chain contract with off-chain database:
    // string public campaignId; // e.g. "c7f9e52a-4b2f-48c6-86a5-89c32c5848a9"
    
    IERC20 public token;
    address public campaignOwner;
    uint256 public totalDeposits;
    bool public isActive;
    
    // New state variables
    uint256 public startTime;
    uint256 public endTime;
    uint256 public maxContribution;
    uint256 public minContribution;
    address public emergencyAdmin;
    bool public emergencyPaused;
    
    struct Milestone {
        string title;
        uint256 targetAmount;
        uint256 releasedAmount;
        bool completed;
    }
    mapping(uint256 => Milestone) public milestones;
    uint256 public milestoneCount;
    
    // Events
    event DepositReceived(address indexed from, uint256 amount);
    event FundsReleased(address indexed to, uint256 amount);
    event MilestoneCompleted(uint256 indexed milestoneId, uint256 amount);
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event ContributionLimitUpdated(uint256 min, uint256 max);
    
    constructor(
        address _token,
        address _campaignOwner,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minContribution,
        uint256 _maxContribution
    ) {
        token = IERC20(_token);
        campaignOwner = _campaignOwner;
        startTime = _startTime;
        endTime = _endTime;
        minContribution = _minContribution;
        maxContribution = _maxContribution;
        isActive = true;
    }
    
    modifier onlyEmergencyAdmin() {
        require(msg.sender == emergencyAdmin, "Not emergency admin");
        _;
    }
    
    modifier notEmergencyPaused() {
        require(!emergencyPaused, "Contract is emergency paused");
        _;
    }
    
    modifier withinTimeframe() {
        require(block.timestamp >= startTime, "Campaign not started");
        require(block.timestamp <= endTime, "Campaign ended");
        _;
    }
    
    function deposit(uint256 amount) external whenNotPaused notEmergencyPaused withinTimeframe {
        require(isActive, "Campaign is not active");
        require(amount > 0, "Amount must be greater than 0");
        require(amount >= minContribution, "Amount below minimum contribution");
        require(amount <= maxContribution, "Amount above maximum contribution");
        
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        totalDeposits += amount;
        
        emit DepositReceived(msg.sender, amount);
    }
    
    function withdraw(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= totalDeposits, "Insufficient funds");
        
        totalDeposits -= amount;
        require(token.transfer(campaignOwner, amount), "Transfer failed");
        
        emit FundsReleased(campaignOwner, amount);
    }
    
    function addMilestone(string memory title, uint256 targetAmount) external onlyOwner {
        milestones[milestoneCount] = Milestone(title, targetAmount, 0, false);
        milestoneCount++;
    }
    
    function releaseMilestoneFunds(uint256 milestoneId, uint256 amount) external onlyOwner {
        require(milestoneId < milestoneCount, "Invalid milestone");
        require(amount > 0, "Amount must be greater than 0");
        require(amount <= totalDeposits, "Insufficient funds");
        
        Milestone storage milestone = milestones[milestoneId];
        require(!milestone.completed, "Milestone already completed");
        
        milestone.releasedAmount += amount;
        totalDeposits -= amount;
        
        require(token.transfer(campaignOwner, amount), "Transfer failed");
        
        // Check if milestone is now completed
        if (milestone.releasedAmount >= milestone.targetAmount) {
            milestone.completed = true;
            emit MilestoneCompleted(milestoneId, amount);
        }
    }
    
    function setEmergencyAdmin(address _admin) external onlyOwner {
        emergencyAdmin = _admin;
    }
    
    function emergencyPause() external onlyEmergencyAdmin {
        emergencyPaused = true;
        emit EmergencyPaused(msg.sender);
    }
    
    function emergencyUnpause() external onlyEmergencyAdmin {
        emergencyPaused = false;
        emit EmergencyUnpaused(msg.sender);
    }
    
    function updateContributionLimits(uint256 min, uint256 max) external onlyOwner {
        require(min <= max, "Invalid limits");
        minContribution = min;
        maxContribution = max;
        emit ContributionLimitUpdated(min, max);
    }
    
    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function resume() external onlyOwner {
        _unpause();
    }
    
    function getMilestone(uint256 milestoneId) external view returns (
        string memory title,
        uint256 targetAmount,
        uint256 releasedAmount,
        bool completed
    ) {
        require(milestoneId < milestoneCount, "Invalid milestone");
        Milestone memory milestone = milestones[milestoneId];
        return (milestone.title, milestone.targetAmount, milestone.releasedAmount, milestone.completed);
    }
} 