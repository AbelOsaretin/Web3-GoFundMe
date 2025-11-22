// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// interface IERC20 {
//     function transfer(address, uint) external returns (bool);

//     function transferFrom(address, address, uint) external returns (bool);
// }

// contract CrowdFund {
//     event Launch(
//         uint id,
//         string title,
//         string description,
//         address indexed creator,
//         uint goal,
//         uint32 startAt,
//         uint32 endAt
//     );
//     event Cancel(uint id);
//     event Pledge(uint indexed id, address indexed caller, uint amount);
//     event Unpledge(uint indexed id, address indexed caller, uint amount);
//     event Claim(uint id);
//     event Refund(uint id, address indexed caller, uint amount);

//     struct Campaign {
//         // Title of campaign
//         string title;
//         // Description of campaign
//         string description;
//         // Category of campaign
//         string category;
//         // Creator of campaign
//         address creator;
//         // Amount of tokens to raise
//         uint goal;
//         // Total amount pledged
//         uint pledged;
//         // Timestamp of start of campaign
//         uint32 startAt;
//         // Timestamp of end of campaign
//         uint32 endAt;
//         // True if goal was reached and creator has claimed the tokens.
//         bool claimed;
//     }

//     IERC20 public immutable TOKEN;
//     // Total count of campaigns created.
//     // It is also used to generate id for new campaigns.
//     uint public count;
//     // Mapping from id to Campaign
//     mapping(uint => Campaign) public campaigns;
//     // Mapping from campaign id => pledger => amount pledged
//     mapping(uint => mapping(address => uint)) public pledgedAmount;

//     constructor(address _token) {
//         TOKEN = IERC20(_token);
//     }

//     function launch(
//         string memory _title,
//         string memory _description,
//         string memory _category,
//         uint _goal,
//         uint32 _startAt,
//         uint32 _endAt
//     ) external {
//         require(_startAt >= block.timestamp, "start at < now");
//         require(_endAt >= _startAt, "end at < start at");
//         require(_endAt <= block.timestamp + 90 days, "end at > max duration");

//         count += 1;
//         campaigns[count] = Campaign({
//             title: _title,
//             description: _description,
//             category: _category,
//             creator: msg.sender,
//             goal: _goal,
//             pledged: 0,
//             startAt: _startAt,
//             endAt: _endAt,
//             claimed: false
//         });

//         emit Launch(
//             count,
//             _title,
//             _description,
//             msg.sender,
//             _goal,
//             _startAt,
//             _endAt
//         );
//     }

//     function cancel(uint _id) external {
//         Campaign memory campaign = campaigns[_id];
//         require(campaign.creator == msg.sender, "not creator");
//         require(block.timestamp < campaign.startAt, "started");

//         delete campaigns[_id];
//         emit Cancel(_id);
//     }

//     function pledge(uint _id, uint _amount) external {
//         Campaign storage campaign = campaigns[_id];
//         require(block.timestamp >= campaign.startAt, "not started");
//         require(block.timestamp <= campaign.endAt, "ended");

//         campaign.pledged += _amount;
//         pledgedAmount[_id][msg.sender] += _amount;
//         // TOKEN.transferFrom(msg.sender, address(this), _amount);

//         bool success = TOKEN.transferFrom(msg.sender, address(this), _amount);
//         require(success, "Transfer failed");

//         emit Pledge(_id, msg.sender, _amount);
//     }

//     function unpledge(uint _id, uint _amount) external {
//         Campaign storage campaign = campaigns[_id];
//         require(block.timestamp <= campaign.endAt, "ended");

//         campaign.pledged -= _amount;
//         pledgedAmount[_id][msg.sender] -= _amount;
//         bool success = TOKEN.transfer(msg.sender, _amount);
//         require(success, "Transfer failed");

//         emit Unpledge(_id, msg.sender, _amount);
//     }

//     function claim(uint _id) external {
//         Campaign storage campaign = campaigns[_id];
//         require(campaign.creator == msg.sender, "not creator");
//         require(block.timestamp > campaign.endAt, "not ended");
//         require(campaign.pledged >= campaign.goal, "pledged < goal");
//         require(!campaign.claimed, "claimed");

//         campaign.claimed = true;
//         bool success = TOKEN.transfer(campaign.creator, campaign.pledged);
//         require(success, "Transfer failed");

//         emit Claim(_id);
//     }

//     function refund(uint _id) external {
//         Campaign memory campaign = campaigns[_id];
//         require(block.timestamp > campaign.endAt, "not ended");
//         require(campaign.pledged < campaign.goal, "pledged >= goal");

//         uint bal = pledgedAmount[_id][msg.sender];
//         pledgedAmount[_id][msg.sender] = 0;
//         bool success = TOKEN.transfer(msg.sender, bal);
//         require(success, "Transfer failed");

//         emit Refund(_id, msg.sender, bal);
//     }
// }
