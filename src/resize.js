module.exports = function(width, options) {
	return '//image.webservices.ft.com/v1/images/raw/' + encodeURIComponent(options.fn(this)) + '?width=' + width + '&source=docs&fit=scale-down';
};
