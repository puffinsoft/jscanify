let loadedOpenCV = false

const openCvURL = "https://docs.opencv.org/4.7.0/opencv.js"

function loadOpenCV(onComplete) {
    if (loadedOpenCV) {
        onComplete()
    } else {
        $('#demo-result').text('Loading OpenCV...')
        const script = document.createElement("script")
        script.src = openCvURL

        script.onload = function () {
            setTimeout(function () {
                onComplete()
            }, 1000)
            loadedOpenCV = true
        }
        document.body.appendChild(script)
    }
}

const scanner = new jscanify()
$('#demo-images .image-container').click(function () {
    $('.image-container.selected').removeClass('selected')
    $(this).addClass('selected')
    const imageSrc = $(this).find('img').data('url')
    loadOpenCV(function () {
        $('#demo-result').empty()

        const newImg = document.createElement("img")
        newImg.src = imageSrc

        newImg.onload = function(){
            const resultCanvas = scanner.extractPaper(newImg, 386, 500);
            $('#demo-result').append(resultCanvas);
                
            const highlightedCanvas = scanner.highlightPaper(newImg)
            $('#demo-result').append(highlightedCanvas);
        }
    })
})