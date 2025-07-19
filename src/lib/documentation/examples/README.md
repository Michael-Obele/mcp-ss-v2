# AI Developer Integration Guide

This guide provides examples and best practices for integrating the shadcn-svelte MCP server with AI assistants and language models.

## Table of Contents

1. [Introduction](#introduction)
2. [Integration Patterns](#integration-patterns)
3. [Example Workflows](#example-workflows)
4. [Code Examples](#code-examples)
5. [Best Practices](#best-practices)

## Introduction

The shadcn-svelte MCP server is designed to be integrated with AI assistants and language models to provide them with access to shadcn-svelte component documentation. This enables AI systems to answer questions, provide code examples, and assist developers with implementing shadcn-svelte components in their projects.

## Integration Patterns

There are several patterns for integrating the shadcn-svelte MCP server with AI systems:

### Direct API Integration

AI systems can directly call the MCP server API to retrieve information about shadcn-svelte components. This approach is suitable for AI systems that have the ability to make HTTP requests and process JSON responses.

### MCP Protocol Integration

AI systems that support the Model Context Protocol (MCP) can integrate with the shadcn-svelte MCP server as an MCP provider. This approach provides a standardized way for AI systems to discover and use the server's capabilities.

### Proxy Integration

For AI systems that cannot directly integrate with the MCP server, a proxy service can be used to mediate between the AI system and the MCP server. This approach is suitable for AI systems with limited integration capabilities.

## Example Workflows

### Component Information Retrieval

1. User asks the AI assistant about a shadcn-svelte component
2. AI assistant identifies the component name from the user's query
3. AI assistant calls the `getComponentInfo` tool with the component name
4. AI assistant formats and presents the component information to the user

### Code Example Generation

1. User asks the AI assistant for a code example of a shadcn-svelte component
2. AI assistant identifies the component name and example type from the user's query
3. AI assistant calls the `getComponentExample` tool with the component name and example type
4. AI assistant formats and presents the code example to the user

### Component Search

1. User asks the AI assistant for a component that provides a specific functionality
2. AI assistant extracts key terms from the user's query
3. AI assistant calls the `searchComponents` tool with the search query
4. AI assistant presents the search results to the user
5. User selects a component from the results
6. AI assistant calls the `getComponentInfo` tool with the selected component name
7. AI assistant formats and presents the component information to the user

### Theming Guidance

1. User asks the AI assistant how to customize the appearance of a shadcn-svelte component
2. AI assistant identifies the component name from the user's query
3. AI assistant calls the `getThemingInfo` tool with the component name
4. AI assistant formats and presents the theming information to the user

### Troubleshooting

1. User asks the AI assistant for help with an issue they're experiencing with a shadcn-svelte component
2. AI assistant identifies the component name and issue from the user's query
3. AI assistant calls the `getTroubleshooting` tool with the component name and issue
4. AI assistant formats and presents the troubleshooting information to the user

## Code Examples

### OpenAI Function Calling Integration

```javascript
const { OpenAI } = require('openai');
const fetch = require('node-fetch');

// Initialize OpenAI client
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

// Function to query the MCP server
async function queryMCPServer(requestData) {
	const response = await fetch('https://your-mcp-server.com/api/mcp', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(requestData)
	});

	return await response.json();
}

// Define OpenAI functions for MCP tools
const mcpFunctions = [
	{
		name: 'getComponentInfo',
		description: 'Retrieves general information about a specific shadcn-svelte component',
		parameters: {
			type: 'object',
			properties: {
				componentName: {
					type: 'string',
					description: 'Name of the component to retrieve information for'
				}
			},
			required: ['componentName']
		}
	},
	{
		name: 'getComponentExample',
		description: 'Retrieves code examples for a specific shadcn-svelte component',
		parameters: {
			type: 'object',
			properties: {
				componentName: {
					type: 'string',
					description: 'Name of the component to retrieve examples for'
				},
				exampleType: {
					type: 'string',
					description: 'Type of example to retrieve (basic, advanced, theming, etc.)'
				}
			},
			required: ['componentName']
		}
	}
	// Additional functions for other MCP tools...
];

// Example: Process a user query
async function processUserQuery(userQuery) {
	// Step 1: Call OpenAI API to determine which function to call
	const messages = [
		{
			role: 'system',
			content:
				'You are a helpful assistant that provides information about shadcn-svelte components.'
		},
		{ role: 'user', content: userQuery }
	];

	const response = await openai.chat.completions.create({
		model: 'gpt-4',
		messages,
		functions: mcpFunctions,
		function_call: 'auto'
	});

	const responseMessage = response.choices[0].message;

	// Step 2: Check if the model wants to call a function
	if (responseMessage.function_call) {
		const functionName = responseMessage.function_call.name;
		const functionArgs = JSON.parse(responseMessage.function_call.arguments);

		// Step 3: Call the MCP server with the appropriate tool
		const mcpResponse = await queryMCPServer({
			type: 'tool_call',
			tool: functionName,
			parameters: functionArgs
		});

		// Step 4: Call OpenAI API again with the function response
		const secondResponse = await openai.chat.completions.create({
			model: 'gpt-4',
			messages: [
				...messages,
				responseMessage,
				{
					role: 'function',
					name: functionName,
					content: JSON.stringify(mcpResponse.result)
				}
			]
		});

		return secondResponse.choices[0].message.content;
	} else {
		return responseMessage.content;
	}
}

// Example usage
processUserQuery('How do I use the Button component from shadcn-svelte?')
	.then((response) => console.log(response))
	.catch((error) => console.error(error));
```

### LangChain Integration

```python
from langchain.agents import Tool, AgentExecutor, LLMSingleActionAgent
from langchain.prompts import StringPromptTemplate
from langchain.llms import OpenAI
from langchain.chains import LLMChain
import requests
import json

# Function to query the MCP server
def query_mcp_server(request_data):
    response = requests.post(
        'https://your-mcp-server.com/api/mcp',
        headers={
            'Content-Type': 'application/json'
        },
        json=request_data
    )

    return response.json()

# Define MCP tool functions
def get_component_info(component_name):
    result = query_mcp_server({
        'type': 'tool_call',
        'tool': 'getComponentInfo',
        'parameters': {
            'componentName': component_name
        }
    })

    return json.dumps(result['result'], indent=2)

def get_component_example(component_name, example_type=None):
    params = {'componentName': component_name}
    if example_type:
        params['exampleType'] = example_type

    result = query_mcp_server({
        'type': 'tool_call',
        'tool': 'getComponentExample',
        'parameters': params
    })

    return json.dumps(result['result'], indent=2)

def search_components(query):
    result = query_mcp_server({
        'type': 'tool_call',
        'tool': 'searchComponents',
        'parameters': {
            'query': query
        }
    })

    return json.dumps(result['result'], indent=2)

# Define LangChain tools
tools = [
    Tool(
        name="GetComponentInfo",
        func=get_component_info,
        description="Retrieves general information about a specific shadcn-svelte component. Input should be the component name."
    ),
    Tool(
        name="GetComponentExample",
        func=get_component_example,
        description="Retrieves code examples for a specific shadcn-svelte component. Input should be a JSON string with 'componentName' and optional 'exampleType'."
    ),
    Tool(
        name="SearchComponents",
        func=search_components,
        description="Searches for shadcn-svelte components based on keywords or functionality. Input should be the search query."
    )
]

# Define prompt template
template = """You are a helpful assistant that provides information about shadcn-svelte components.
You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:"""

prompt = StringPromptTemplate.from_template(template)

# Initialize LLM
llm = OpenAI(temperature=0)

# Create agent
agent = LLMSingleActionAgent(
    llm_chain=LLMChain(llm=llm, prompt=prompt),
    output_parser=None,  # Define your output parser
    stop=["\nObservation:"],
    allowed_tools=[tool.name for tool in tools]
)

# Create agent executor
agent_executor = AgentExecutor.from_agent_and_tools(
    agent=agent,
    tools=tools,
    verbose=True
)

# Example usage
result = agent_executor.run("How do I use the Button component from shadcn-svelte?")
print(result)
```

## Best Practices

### Effective Prompting

1. **Be Specific**: When prompting the AI system, be specific about the component and the information you're looking for.

2. **Include Context**: Provide context about the user's project and requirements to help the AI system provide more relevant information.

3. **Use Structured Prompts**: Structure your prompts to clearly indicate the component name, the type of information needed, and any specific requirements.

### Error Handling

1. **Handle Missing Components**: If the requested component doesn't exist, suggest similar components or provide general information about the component category.

2. **Handle Ambiguous Queries**: If the user's query is ambiguous, ask for clarification or provide information about multiple possible components.

3. **Handle API Errors**: Implement robust error handling for API calls to the MCP server.

### Performance Optimization

1. **Cache Responses**: Cache responses from the MCP server to reduce latency and server load.

2. **Batch Requests**: When possible, batch multiple requests into a single API call.

3. **Use Pagination**: When retrieving large collections of data, use pagination to improve performance.

### User Experience

1. **Format Responses**: Format responses from the MCP server to be easily readable by users.

2. **Provide Context**: Include context about the component and its usage in your responses.

3. **Suggest Next Steps**: Suggest next steps or related information that might be helpful to the user.
