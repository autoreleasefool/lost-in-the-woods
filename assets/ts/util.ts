function hostname(url: string) {
    const parsedURL = new URL(url);
    return parsedURL.hostname;
}

window.addEventListener('load', () => {
    const websitesToReplace = document.querySelectorAll('span.extract-hostname');
    websitesToReplace.forEach(element => {
        element.innerHTML = hostname(element.innerHTML);
    });
});
