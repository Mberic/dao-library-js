import { initialize, protocolVersion } from "@dao-library/core/dao";
import { createProposal, getActionObject } from "@dao-library/core/proposal"
import { addAddresses, approve, removeAddresses } from "@dao-library/voting/multisig";
import { isMember } from "@dao-library/membership";

import { ethers } from "ethers";

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  let checksumAddress = ethers.getAddress( data.metadata.msg_sender );
  action_proxy(hexToText(data.payload), checksumAddress );
  return "accept";
}

async function handle_inspect(data) {
  
  console.log("Received inspect request data " + JSON.stringify(data));
  
  const payload = hexToText(data["payload"]);
  const report = await inspect_proxy(payload.toString());
  const utf8Bytes = new TextEncoder().encode(report);
  const hexString = ethers.hexlify(utf8Bytes);

  const inspect_req = await fetch(rollup_server + '/report', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "payload": hexString })
  });
  
  return "accept";
}

async function inspect_proxy(payload) {
  
  let report;

  switch (payload) {
    case 'protocol-version':
      report = await protocolVersion();
      break;
    default:
      report = 'Inspect action failed';
  }

  return report;
}

async function action_proxy(payload, address){

  const obj = JSON.parse(payload);

  let action = obj.action;
  let params = obj.params;

  let result;

  /**
   * - initialise DAO if not yet initialized
   * - set up a "trusted delegate" i.e initial member
   * 
   * - if necessary, you may also provide this "trusted delegate" some permissions
   * since we are creating a multisig DAO, we'll assume all members have the same rights
   */

  if (action == "initialize"){
    // this address (0xf39..2266) is our trusted delegate.
    if (address == ethers.getAddress("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")){
      let version = await protocolVersion();

      if (version == null){
        initialize(...params);
        addAddresses(address);
      } else {
        console.log("\nDAO already initialised!\n");
        }
    } else {
      console.log("\nUnaccepted initializer address\n");
      }
  } else if (await isMember(address)){

    switch(action){
      case "createProposal":
        result = await createProposal(...params);
        console.log("\nProposal ID: " + result + "\n");
        break;
      case "approve":
        result = await approve(...params);
        console.log("\nResult of approve request: " + result + "\n");
        break;
      case "getActionObject":
        result = getActionObject(...params);
        console.log("\nAction object for given proposalID "+ result + "\n");
        break;
      case "execute":
        let actionObject = await getActionObject(...params);
        _action_proxy(actionObject[0]);
        break;
      default:
        console.log("\nFailed to execute any action\n");
    }
  } else {
    console.log("\nSender address not a member\n");
  }
}

// This is an internal function UNLIKE action_proxy which must be accessed externally
function _action_proxy(actionObject){

  let action = actionObject.action;
  let params = actionObject.params;

  let result;

  switch(action){
    case "addAddresses":
        result = addAddresses(...params);
        console.log("Execution of add address request :" + result);
        break;
    case "removeAddresses":
      result = removeAddresses(...params);
      console.log("Execution of remove address request :" + result);
      break;
    default:
        console.log("Failed to execute any action");
    }
}


function hexToText(hexString){
  // Remove the "0x" prefix if present
  const hexWithoutPrefix = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
     
  // Convert hex to Uint8Array
  const byteArray = new Uint8Array(hexWithoutPrefix.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  // Create a TextDecoder
  const textDecoder = new TextDecoder("utf-8");

  // Convert the Uint8Array to text
  const text = textDecoder.decode(byteArray);

  return text;

}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();