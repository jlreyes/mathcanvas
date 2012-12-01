/* General utility functions
 * Author jlreyes
 */

/* Returns true iff x in non-null and defined */
exports.exists = function(x) {
    return (x !== undefined && x !== null);
};

exports.listToSet = function(list) {
    if (!exports.exists(list)) return {};
    var result = {};
    for (var i = 0; i < list.length; i++)
        result[list[i]] = list[i];
    return result;
};