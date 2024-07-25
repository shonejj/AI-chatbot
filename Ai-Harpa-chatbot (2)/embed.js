<script>
document.addEventListener('DOMContentLoaded', function() {
    function appendiframe () {
        const createIframe = document.createElement('iframe');
        createIframe.setAttribute('id', 'checkboxIframe');
        createIframe.setAttribute('src', 'http://localhost:9090/');
        createIframe.setAttribute('style', 'width: 50%;height: 100%;border: none;position: fixed;z-index: 9999;right:0;top: 0px;');
        document.body.appendChild(createIframe);
    }
    appendiframe();
})


window.addEventListener('message', function(event) {

    if (event.data === 'requestContent') {
        const content = document.body.innerText;
        event.source.postMessage(content, event.origin);
    }
});
</script>