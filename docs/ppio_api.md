> ## Documentation Index

> Fetch the complete documentation index at: https://ppio.com/docs/llms.txt

> Use this file to discover all available pages before exploring further.



\# 大语言模型



\## 模型能力



大语言模型（LLM）是一种基于深度学习和自然语言处理技术的人工智能模型。经过大量的文本数据进行训练，它能够理解、生成和处理人类语言。主要具备以下能力：



\* \*\*文本生成\*\*



&nbsp; 能够基于上下文生成逻辑连贯的文本内容，并根据需要调整输出风格。

\* \*\*语言理解\*\*



&nbsp; 能够准确理解输入文本的含义，并支持结合上下文进行对话。

\* \*\*文本翻译\*\*



&nbsp; 具备跨语言生成和理解的能力，可以实现不同语言之间的文本翻译。

\* \*\*知识问答\*\*



&nbsp; 具有丰富的知识储备，能够回答文化、科学、历史等各个领域的问题。

\* \*\*代码理解和生成\*\*



&nbsp; 能够理解并生成代码（如Python、Java、C++等），支持识别代码错误，提供代码建议等。

\* \*\*文本分类和摘要\*\*



&nbsp; 能够理解复杂语句，进行信息分类和抽取，可以提取文本的关键点进行自动摘要。



\## 模型选型



在\[大语言模型服务](https://ppio.com/model-api/product/llm-api)页面，您可以查看平台支持的大语言模型列表，了解模型的基本介绍，价格等信息。单击具体的某一个模型，可以打开详情页面，按需进行在线体验。在结合具体任务进行充分体验后，您可以对比模型表现，选择适合的模型。



选型时，请了解以下注意事项：



\* DeepSeek R1 和 V3 community 版本仅供尝鲜（也是全参数满血版模型，稳定性和效果无差异），如需大量调用，请\*\*充值并切换到非 community 版本\*\*。



\## 接口调用



PPIO 派欧云提供了与 OpenAI API 标准兼容的 API 服务，方便您集成到现有应用程序中。



\* \[ChatCompletion](https://platform.openai.com/docs/api-reference/chat)，支持 streaming 模式和常规模式。

\* \[Completion](https://platform.openai.com/docs/api-reference/completions)，支持 streaming 模式和常规模式。



如果您已经在使用 OpenAI 的 ChatCompletion 或 Completion API，您只需将基础 URL 设置为`https://api.ppio.com/openai`，获取并设置您的 API 密钥，并按需更新模型名称，即可接入大语言模型 API 服务。



<Tip>

&nbsp; 关于如何获取 API 密钥，请参见\[管理 API 密钥](/support/api-key)。

</Tip>



\### 代码示例



\#### Python



<CodeGroup>

&nbsp; ```python ChatCompletion theme={null}

&nbsp; from openai import OpenAI



&nbsp; client = OpenAI(

&nbsp;     base\_url="https://api.ppio.com/openai",

&nbsp;     api\_key="<Your API Key>",

&nbsp; )



&nbsp; model = "deepseek/deepseek-r1"

&nbsp; stream = True  # 或 False

&nbsp; max\_tokens = 512



&nbsp; chat\_completion\_res = client.chat.completions.create(

&nbsp;     model=model,

&nbsp;     messages=\[

&nbsp;         {

&nbsp;             "role": "system",

&nbsp;             "content": "您是一个专业的 AI 文档助手。",

&nbsp;         },

&nbsp;         {

&nbsp;             "role": "user",

&nbsp;             "content": "PPIO 派欧云提供的 GPU 容器实例能用于哪些场景？",

&nbsp;         }

&nbsp;     ],

&nbsp;     stream=stream,

&nbsp;     max\_tokens=max\_tokens,

&nbsp; )



&nbsp; if stream:

&nbsp;     for chunk in chat\_completion\_res:

&nbsp;         print(chunk.choices\[0].delta.content or "", end="")

&nbsp; else:

&nbsp;     print(chat\_completion\_res.choices\[0].message.content)

&nbsp; ```



&nbsp; ```python Completion theme={null}

&nbsp; from openai import OpenAI



&nbsp; client = OpenAI(

&nbsp;     base\_url="https://api.ppio.com/openai",

&nbsp;     api\_key="<Your API Key>",

&nbsp; )



&nbsp; model = "deepseek/deepseek-r1"

&nbsp; stream = True  # 或 False

&nbsp; max\_tokens = 512



&nbsp; completion\_res = client.completions.create(

&nbsp;     model=model,

&nbsp;     prompt="PPIO 派欧云提供的 GPU 容器实例能用于哪些场景？",

&nbsp;     stream=stream,

&nbsp;     max\_tokens=max\_tokens,

&nbsp; )



&nbsp; if stream:

&nbsp;     for chunk in completion\_res:

&nbsp;         print(chunk.choices\[0].text or "", end="")

&nbsp; else:

&nbsp;     print(completion\_res.choices\[0].text)

&nbsp; ```

</CodeGroup>



\#### Curl



<CodeGroup>

&nbsp; ```bash ChatCompletion theme={null}

&nbsp; export API\_KEY="<Your API Key>"



&nbsp; curl "https://api.ppio.com/openai/v1/chat/completions" \\

&nbsp;   -H "Content-Type: application/json" \\

&nbsp;   -H "Authorization: Bearer ${API\_KEY}" \\

&nbsp;   -d '{

&nbsp;     "model": "deepseek/deepseek-r1",

&nbsp;     "messages": \[

&nbsp;         {

&nbsp;             "role": "system",

&nbsp;             "content": "您是一个专业的 AI 文档助手。"

&nbsp;         },

&nbsp;        {

&nbsp;             "role": "user",

&nbsp;             "content": "PPIO 派欧云提供的 GPU 容器实例能用于哪些场景？"

&nbsp;         }

&nbsp;     ],

&nbsp;     "max\_tokens": 512

&nbsp; }'

&nbsp; ```



&nbsp; ```bash Completion theme={null}

&nbsp; export API\_KEY="<Your API Key>"



&nbsp; curl "https://api.ppio.com/openai/v1/completions" \\

&nbsp;   -H "Content-Type: application/json" \\

&nbsp;   -H "Authorization: Bearer ${API\_KEY}" \\

&nbsp;   -d '{

&nbsp;     "model": "deepseek/deepseek-r1",

&nbsp;     "prompt": "PPIO 派欧云提供的 GPU 容器实例能用于哪些场景？",

&nbsp;     "max\_tokens": 512

&nbsp; }'

&nbsp; ```

</CodeGroup>



\### 重点参数



\#### 基础参数



`model`：要调用的模型。您可以在\[大语言模型服务页面](https://ppio.com/model-api/product/llm-api)查看平台支持的大语言模型列表。



\#### 消息角色



> 仅适用于ChatCompletion。



`messages`：和大模型进行交互时的输入输出。每条消息都属于一个角色。消息可以帮助您获得更好的输出，您可以尝试不同的方法，以获得更好的结果。



\* `content`：消息内容。

\* `role`：消息作者的角色。

&nbsp; \* `system`：设定AI角色，告知模型要扮演的角色或者行为。

&nbsp; \* `user`：用户输入给模型的文本。

&nbsp; \* `assistant`：模型生成的回复。用户也可以预先填写示例，告知模型应该如何回应当前请求。

\* `name`：可选，用于区分相同角色的消息作者。



\#### 提示词



> 仅适用于Completion。



`prompt`：生成补全的提示词。是用户输入给大语言模型的文本信息，用于明确地告诉模型想要解决的问题或完成的任务，也是模型理解需求并生成相关、准确内容的基础。



\#### 控制生成



不同的参数组合可以让模型生成出更符合特定需求的内容。



\*\*文本多样性\*\*



> `temperature`与`top\_p`均可控制生成文本的多样性，建议您只设置其中一个值。设置的数值越大，生成的文本越多样。数值越小，生成的文本越确定。



\* `temperature`：采样温度，调整生成文本的随机性。

\* `top\_p`：核采样，控制候选词累计概率。

\* `top\_k`：限制候选词数量。



\*\*内容重复性\*\*



\* `presence\_penalty`：存在惩罚，控制模型生成文本时的内容重复度。如果一个 Token 在文本中已经出现，就会受到惩罚，这会使得模型引入更多新的 Token 。

\* `frequency\_penalty`：概率惩罚，控制生成文本中某些词的出现频率。让 Token 每次在文本中出现都受到惩罚，从而减少这些 Token 在未来生成中的概率，阻止模型重复使用相同的 Token。

\* `repetition\_penalty`：重复惩罚值，用于抑制或者鼓励重复。



\#### 输出限制



\* `max\_tokens`：单次请求返回的最大 Token 数。如果模型生成的 Token 数超过`max\_tokens`的值，会返回截断后的内容。

\* `stream`：控制输出是否是流式输出。对于一些输出内容比较多的模型，建议设置为流式输出，防止输出过长，导致输出超时。

&nbsp; \* `true`：流式输出，即边生成边输出，模型每生成一部分内容就返回一个片段。

&nbsp; \* `false`：模型生成完所有内容后一次性返回结果。

\* `stop`：终止字符。当模型生成的文本包含`stop`设置的字符串时，模型会停止输出。





Built with \[Mintlify](https://mintlify.com).

