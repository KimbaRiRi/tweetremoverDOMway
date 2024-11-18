/*

This script is designed to delete tweets directly from your browser console. It operates without the need for API keys and uses your regular Twitter login.

Please note that using this script may violate Twitter's terms of service and could result in your account being banned. Use at your own risk.

==========================

Usage

1. Open your Twitter profile in a browser. Note that your timeline may only display tweets from the last 60 days.

2. Open the console in the developer tools (F12).

3. Paste the script and press enter.

4. Ensure the browser window remains active and do not switch tabs or minimize it.

5. Tweets will be removed from your profile view.

==========================

Copyright 2023 ...Me, I guess?

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Feel free to copy, modify, and distribute this script. If you do, please keep this header intact.

*/

const waitForElement = async (selector) => {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(() => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            subtree: true,
            childList: true,
        });
    });
};

const removeTweets = async () => {
    const moreOptions = '[data-testid="tweet"] [aria-label="More"][data-testid="caret"]';

    while (document.querySelectorAll(moreOptions).length > 0) {
        await new Promise((r) => setTimeout(r, 1500));

        const unlikeButton = document.querySelector('[data-testid="unlike"]');
        if (unlikeButton) {
            unlikeButton.click();
            document.querySelector('[data-testid="tweet"]').remove();
        }

        const unretweetButton = document.querySelector('[data-testid="unretweet"]');
        if (unretweetButton) {
            unretweetButton.click();
            const confirmUnretweet = await waitForElement('[data-testid="unretweetConfirm"]');
            confirmUnretweet.click();
        } else {
            const caretButton = await waitForElement(moreOptions);
            caretButton.click();
            const menuItem = await waitForElement('[role="menuitem"]');
            if (menuItem.textContent.includes("@")) {
                caretButton.click();
                document.querySelector('[data-testid="tweet"]').remove();
            } else {
                menuItem.click();
                const confirmDelete = await waitForElement('[data-testid="confirmationSheetConfirm"]');
                confirmDelete.click();
            }
        }

        deleteCount++;

        if (deleteCount % 5 == 0)
            console.log(`${new Date().toUTCString()} Removed ${deleteCount} Tweets`);
    }

    console.log("Switching to Replies.");
    document.querySelectorAll('[aria-label="Profile timelines"]>div>div>div>div>a')[1].click();
    await new Promise((r) => setTimeout(r, 2500));
    if (document.querySelectorAll(moreOptions).length > 0) {
        removeTweets();
    } else {
        console.log("Switching to Tweets.");
        document.querySelectorAll('[aria-label="Profile timelines"]>div>div>div>div>a')[0].click();
        await new Promise((r) => setTimeout(r, 2500));
        if (document.querySelectorAll(moreOptions).length > 0) {
            removeTweets();
        }
    }

    console.log("No Tweets left. Please reload to confirm.");
};

let deleteCount = 0;
removeTweets();
