// fetch and set the values from localstorage
document.getElementById("botToken").value = localStorage.getItem("botToken");
document.getElementById("fromChatId").value =
  localStorage.getItem("fromChatId");
document.getElementById("toChatId").value = localStorage.getItem("toChatId");
document.getElementById("fromMessageId").value =
  localStorage.getItem("fromMessageId");
document.getElementById("toMessageId").value =
  localStorage.getItem("toMessageId");
async function startCopying() {
  // Retrieve input values
  var botToken = document.getElementById("botToken").value;
  var fromChatId = document.getElementById("fromChatId").value;
  var toChatId = document.getElementById("toChatId").value;
  var fromMessageId = parseInt(document.getElementById("fromMessageId").value); // Ensure integer type
  var toMessageId = parseInt(document.getElementById("toMessageId").value); // Ensure integer type
  // store all this in localstorage
  localStorage.setItem("botToken", botToken);
  localStorage.setItem("fromChatId", fromChatId);
  localStorage.setItem("toChatId", toChatId);
  localStorage.setItem("fromMessageId", fromMessageId);
  localStorage.setItem("toMessageId", toMessageId);

  // Example of how you might want to construct the command line output
  var commandLineOutput = "Begin Script Execution\n";

  // Append the output to the textarea
  document.getElementById("outputArea").value += commandLineOutput + "\n";

  const bot_api = "https://api.telegram.org/bot";
  const bot_method = "/copyMessages";
  const api_url = bot_api + botToken + bot_method;

  // distribute the messages into chunks of 100 and count how many requests are needed
  var messageCount = toMessageId - fromMessageId + 1; // Include the last message ID
  var requests = Math.ceil(messageCount / 50);

  // send the requests
  for (var i = 0; i < requests; i++) {
    var messageIds = []; // Clear the array at the beginning of each request iteration
    // A JSON-serialized list of 1-100 identifiers of messages in the chat from_chat_id to copy. The identifiers must be specified in a strictly increasing order.
    for (var j = 0; j < 50; j++) {
      var messageId = fromMessageId + i * 50 + j; // Adjust message ID based on iteration
      if (messageId <= toMessageId) {
        messageIds.push(messageId);
      }
    }

    let json = {
      from_chat_id: fromChatId,
      chat_id: toChatId,
      message_ids: messageIds,
    };

    while (true) {
      const response = await fetch(api_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });
      const data = await response.json();
      console.log(data);
      // Append the output to the textarea
      document.getElementById("outputArea").value +=
        JSON.stringify(data) + "\n";
      if (response.status == 200) {
        document.getElementById("outputArea").value +=
          "Messages copied successfully" + "\n";
        await sleep(5000);
        break;
      }
      if (response.status == 429) {
        document.getElementById("outputArea").value +=
          "Too many requests" + "\n";
        let time_to_sleep = data.parameters.retry_after * 1000;
        await sleep(time_to_sleep + 5000);
        // Retry the same request after waiting
        continue;
      }
      if (response.status == 400) {
        document.getElementById("outputArea").value += "Bad request" + "\n";
        break;
      }
    }
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
