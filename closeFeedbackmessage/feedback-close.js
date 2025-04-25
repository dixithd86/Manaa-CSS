function runAction() {
    setTimeout(() => {
        $public.FeedbackMessage.closeFeedbackMessage();
    }, 3000);
}

// Create a MutationObserver to listen for changes in the DOM
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            for (const node of mutation.addedNodes) {
                if (node.id === 'feedbackMessageContainer') {
                    runAction();
                }
            }
        }
    }
});

// Start observing the body for changes
observer.observe(document.body, { childList: true, subtree: true });
