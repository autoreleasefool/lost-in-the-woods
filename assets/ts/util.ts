function hostname(url: string) {
    const parsedURL = new URL(url);
    return parsedURL.hostname;
}

window.addEventListener('load', () => {
    const websitesToReplace = document.querySelectorAll('span.extract-hostname');
    console.log(`Websites: ${JSON.stringify(websitesToReplace)}`);
    websitesToReplace.forEach(element => {
        console.log(`Replacing ${element.innerHTML}`)
        element.innerHTML = hostname(element.innerHTML);
    });
});
