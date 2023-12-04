$(document).ready(function () {
    $('input[name="kontrol_pengaduk"]').change(function () {
        if (this.checked) {
            $('.cylinder').addClass('diaduk');
        } else {
            $('.cylinder').removeClass('diaduk');
        }
    });
});