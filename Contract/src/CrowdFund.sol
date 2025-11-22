// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address, uint) external returns (bool);
    function transferFrom(address, address, uint) external returns (bool);
}

contract CrowdFund {
    event Launch(
        uint id,
        string title,
        string description,
        address indexed creator,
        uint goal,
        uint32 startAt,
        uint32 endAt
    );
    event Cancel(uint id);
    event Pledge(uint indexed id, address indexed caller, uint amount);
    event Unpledge(uint indexed id, address indexed caller, uint amount);
    event Claim(uint id);
    event Refund(uint id, address indexed caller, uint amount);

    struct Campaign {
        string title;
        string description;
        string category;
        address creator;
        uint goal;
        uint pledged;
        uint32 startAt;
        uint32 endAt;
        bool claimed;
    }

    IERC20 public immutable TOKEN;

    uint public count;

    /// 🔥 Pattern 1: Store campaign IDs in an array
    uint[] public campaignIds;

    /// Campaign storage
    mapping(uint => Campaign) public campaigns;

    /// Pledges
    mapping(uint => mapping(address => uint)) public pledgedAmount;

    constructor(address _token) {
        TOKEN = IERC20(_token);
    }

    // -----------------------------------------------------
    //                     CORE LOGIC
    // -----------------------------------------------------

    function launch(
        string memory _title,
        string memory _description,
        string memory _category,
        uint _goal,
        uint32 _startAt,
        uint32 _endAt
    ) external {
        require(_startAt >= block.timestamp, "start at < now");
        require(_endAt >= _startAt, "end at < start at");
        require(_endAt <= block.timestamp + 90 days, "end at > max duration");

        count += 1;

        campaigns[count] = Campaign({
            title: _title,
            description: _description,
            category: _category,
            creator: msg.sender,
            goal: _goal,
            pledged: 0,
            startAt: _startAt,
            endAt: _endAt,
            claimed: false
        });

        /// ⭐ Pattern 1: add to array so we can iterate later
        campaignIds.push(count);

        emit Launch(
            count,
            _title,
            _description,
            msg.sender,
            _goal,
            _startAt,
            _endAt
        );
    }

    function cancel(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp < campaign.startAt, "started");

        delete campaigns[_id];
        emit Cancel(_id);
    }

    function pledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp >= campaign.startAt, "not started");
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged += _amount;
        pledgedAmount[_id][msg.sender] += _amount;

        bool success = TOKEN.transferFrom(msg.sender, address(this), _amount);
        require(success, "Transfer failed");

        emit Pledge(_id, msg.sender, _amount);
    }

    function unpledge(uint _id, uint _amount) external {
        Campaign storage campaign = campaigns[_id];
        require(block.timestamp <= campaign.endAt, "ended");

        campaign.pledged -= _amount;
        pledgedAmount[_id][msg.sender] -= _amount;

        bool success = TOKEN.transfer(msg.sender, _amount);
        require(success, "Transfer failed");

        emit Unpledge(_id, msg.sender, _amount);
    }

    function claim(uint _id) external {
        Campaign storage campaign = campaigns[_id];
        require(campaign.creator == msg.sender, "not creator");
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged >= campaign.goal, "pledged < goal");
        require(!campaign.claimed, "claimed");

        campaign.claimed = true;

        bool success = TOKEN.transfer(campaign.creator, campaign.pledged);
        require(success, "Transfer failed");

        emit Claim(_id);
    }

    function refund(uint _id) external {
        Campaign memory campaign = campaigns[_id];
        require(block.timestamp > campaign.endAt, "not ended");
        require(campaign.pledged < campaign.goal, "pledged >= goal");

        uint bal = pledgedAmount[_id][msg.sender];
        pledgedAmount[_id][msg.sender] = 0;

        bool success = TOKEN.transfer(msg.sender, bal);
        require(success, "Transfer failed");

        emit Refund(_id, msg.sender, bal);
    }

    // -----------------------------------------------------
    //             Pattern 1 helper getters
    // -----------------------------------------------------

    /// Return all campaigns in a single view call
    function getAllCampaigns() external view returns (Campaign[] memory) {
        Campaign[] memory list = new Campaign[](campaignIds.length);

        for (uint i = 0; i < campaignIds.length; i++) {
            list[i] = campaigns[campaignIds[i]];
        }

        return list;
    }

    /// Return the number of campaigns (same as campaignIds.length)
    function getTotalCampaigns() external view returns (uint) {
        return campaignIds.length;
    }
}
