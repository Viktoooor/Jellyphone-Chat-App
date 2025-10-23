// only working function to copy something to clipboard on ios
export function copyToClipboard(ref){
    let selection = window.getSelection();
    let range = document.createRange();

    range.selectNodeContents(ref);
    selection.removeAllRanges();
    selection.addRange(range);

    document.execCommand('copy');

    selection.removeAllRanges();
}