const statusTranslations = {
  100: "Continue",
  101: "Switching Protocols",
  200: "OK",
  201: "Created",
  202: "Accepted",
  203: "Non-Authoritative Information",
  204: "No Content",
  205: "Reset Content",
  206: "Partial Content",
  300: "Multiple Choices",
  301: "Moved Permanently",
  302: "Found",
  303: "See Other",
  304: "Not Modified",
  305: "Use Proxy",
  307: "Temporary Redirect",
  400: "Bad Request",
  401: "Unauthorized",
  402: "Payment Required",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  406: "Not Acceptable",
  407: "Proxy Authentication Required",
  408: "Request Timeout",
  409: "Conflict",
  410: "Gone",
  411: "Length Required",
  412: "Precondition Failed",
  413: "Payload Too Large",
  414: "URI Too Long",
  415: "Unsupported Media Type",
  416: "Range Not Satisfiable",
  417: "Expectation Failed",
  418: "I'm a Teapot",
  422: "Unprocessable Entity",
  423: "Locked",
  424: "Failed Dependency",
  425: "Too Early",
  426: "Upgrade Required",
  428: "Precondition Required",
  429: "Too Many Requests",
  431: "Request Header Fields Too Large",
  500: "Internal Server Error",
  501: "Not Implemented",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  505: "HTTP Version Not Supported",
  506: "Variant Also Negotiates",
  507: "Insufficient Storage",
  508: "Loop Detected",
  510: "Not Extended",
  511: "Network Authentication Required",
};




const fetchFunction = ({ url, options, streamMessage, final, ecb }) => {
    let calledDone = false;
    fetch(url, options)
      .then((res) => {
        streamMessage.value = "";
        if (!res.ok) {
          ecb({ type: "http", content: `HTTP error! Status: ${statusTranslations[res.status]}` });
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.body;
      })
      .then((stream) => {
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
  
        return new ReadableStream({
          start(controller) {
            function push() {
              reader
                .read()
                .then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(decoder.decode(value));
                  push();
                })
                .catch((err) => {
                  console.error("Fetch Error:", err);
                  controller.error(err);
                });
            }
            push();
          },
        });
      })
      .then((readableStream) => {
        const reader = readableStream.getReader();
        let buffer = "";
  
        function processMessage(message) {
          const modMessage = message.replace("data:", "").trim();
  
          const parsedMessage = (() => {
            try {
              return JSON.parse(modMessage);
            } catch (e) {
              return null;
            }
          })();
  
          if (parsedMessage) {
            const text = parsedMessage?.choices[0]?.delta?.content;
            if (text) {
              streamMessage += text;
  
              console.log(text ? text : message);
            } else if (parsedMessage) {
              // console.log(text ? text: parsedMessage);
  
              if (parsedMessage?.choices[0]?.finish_reason === "stop") {
                console.log("success");
              } else if (parsedMessage.choices[0]?.delta?.content !== "") {
                console.log("possible error");
                ecb({ type: "response", content: `Possbile response error.` });
              }
            } else {
              ecb({ type: "response", content: `Content parse error.` });
  
              console.log("possible error2");
            }
          }
          // console.log(message)
  
          // Continue reading the next message
          reader.read().then(({ done, value }) => {
            if (done) {
              // console.log(message);
              if (final && !calledDone) {
                calledDone = true;
                final(streamMessage);
              }
              return;
            }
            buffer += value;
            const messages = buffer.split("\n");
            buffer = messages.pop(); // Store incomplete message for the next read
            messages.forEach(processMessage);
          });
        }
  
        // Start processing messages
        reader.read().then(({ done, value }) => {
          if (!done) {
            buffer += value;
            const messages = buffer.split("\n");
            buffer = messages.pop(); // Store incomplete message for the next read
            messages.forEach(processMessage);
          }
        });
      })
      .catch(console.error);
  };


  const chat = ({messages,model =  "gpt-3.5-turbo", organization, apiKey, streamMessage, final, ecb})=>{

    const newRequest = {
        options: {
          body: JSON.stringify({
            messages,
            model,
            stream: true,
          }),
          headers: {
            Accept: "application/json",
            Authorization:
              `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "OpenAI-Organization": organization,
          },
          method: "post",
          reactNative: { textStreaming: true },
        },
        url: "https://api.openai.com/v1/chat/completions",
      };
      console.log(newRequest);

      fetchFunction({
        ...newRequest,
        streamMessage,
        final,
        ecb
      });

  }

  module.exports = {chat}
