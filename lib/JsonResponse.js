/* A JsonReponse object is the object that we return to the client's json
 * request. It contains one of two mutually-exclusive fields:
 *  errors : An array containing the errors that occurred while processing this
 *           command.
 *  result : An object containg the output of the command */
var JsonResponse = function() {
    this.response = {};
};

JsonResponse.prototype.put = function(key, val) {
    this.response[key] = val;
};

JsonResponse.prototype.putError = function (e) {
    this.response.error = e;
};

JsonResponse.prototype.stringify = function() {
    if (this.response.error !== undefined)
        delete this.response.result;
    return JSON.stringify(this.response);
};

/* Exporting */
exports.create = function() {
    return new JsonResponse();
};