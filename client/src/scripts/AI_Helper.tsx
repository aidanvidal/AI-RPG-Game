import OpenAI from 'openai';

interface Message {
    content: string;
    is_ai_response: boolean;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface User{
    username: string;
    id: string;
    apiKey: string;
    vectorStoreId: string;
    assistantId: string;  
    player: string
}

export const generateAiResponse = async (
    apiKey: string,
    assistantId: string,
    messages: Message[],
    user: User
): Promise<string> => {
    try {
        const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

        // Create a thread for the conversation
        const thread = await client.beta.threads.create();


        const msgs = messageFormatter(messages);
        const lastFiveMessages = msgs.slice(-6);  // Get last 6 messages
      
        for (const msg of lastFiveMessages) {
            await client.beta.threads.messages.create(thread.id, {
                role: msg.role,
                content: msg.content
            });
        }

        // Start the assistant run
        const run = await client.beta.threads.runs.create(thread.id, {
            assistant_id: assistantId,
            instructions: `This is the player's character: ${user.player}.`,
        });

        // Poll for the run status until it is completed
        let runStatus = run.status;
        while (runStatus !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
            const updatedRun = await client.beta.threads.runs.retrieve(thread.id, run.id);
            runStatus = updatedRun.status;
        }

        // Get the assistant's response messages
        const response = await client.beta.threads.messages.list(thread.id);

        // Extract the content of the AI's message (assumes the latest message is the AI's)
        const aiMessage = response.data.find((message) => message.role === "assistant");
        const content = aiMessage?.content[0];
        return (content?.type === "text" ? content.text.value : "No response received from AI.");
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw new Error("Failed to generate AI response.");
    }
};

export const messageFormatter = (messages: Message[]): ChatMessage[] => {
    return messages.map(message => ({
        role: message.is_ai_response ? 'assistant' : 'user',
        content: message.content
    }));
};

export const generateStartMessage = async (user: User): Promise<string> => {
    try {
        const client = new OpenAI({ apiKey: user.apiKey, dangerouslyAllowBrowser: true });

        // Create a thread for the conversation
        const thread = await client.beta.threads.create();

        // Prepare the initial message based on player information
        const initialMessage = `This is the player's character: ${user.player}. Please provide a starting message for the game. 
                                This should describe the player's surroundings, the story, the main goal for the player, 
                                and possible actions the player can take in that moment.`;

        // Send the initial message to the thread
        await client.beta.threads.messages.create(thread.id, {
            role: 'user',
            content: initialMessage
        });

        // Start the assistant run
        const run = await client.beta.threads.runs.create(thread.id, {
            assistant_id: user.assistantId,
            instructions: "Generate a starting message for the game.",
        });

        // Poll for the run status until it is completed
        let runStatus = run.status;
        while (runStatus !== "completed") {
            await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
            const updatedRun = await client.beta.threads.runs.retrieve(thread.id, run.id);
            runStatus = updatedRun.status;
        }

        // Get the assistant's response messages
        const response = await client.beta.threads.messages.list(thread.id);

        // Extract the content of the AI's message (assumes the latest message is the AI's)
        const aiMessage = response.data.find((message) => message.role === "assistant");
        const content = aiMessage?.content[0];
        return (content?.type === "text" ? content.text.value : "No response received from AI.");
    } catch (error) {
        console.error("Error generating starting message:", error);
        throw new Error("Failed to generate starting message.");
    }
};
