let queueInitialized = false;

const queue: Function[] = [];
let queueRunning: boolean = false;

export const initializeQueue = () => {
    // Check if already initialized
    if (queueInitialized) return;
    queueInitialized = true;

    // Initialize queue
    setInterval(handleQueue, 5 * 1000); // Every 5 seconds
    console.log('Queue initialized!');
};

export const addToQueue = (action: Function) => {
    queue.push(action);
};

const handleQueue = async () => {
    try {
        // If no actions, return
        if (queue.length < 1) return;

        // If queue is already running, return
        if (queueRunning) return;
        queueRunning = true;

        // Execute oldest action
        const action = queue.shift();
        await action();

        // Set queue to not running
        queueRunning = false;
    } catch (error) {
        console.error('Failed to handle queue!', error);
        queueRunning = false;
    }
};