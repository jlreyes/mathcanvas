/* General utility functions
 * Author jlreyes
 */

/* Returns true iff x in non-null and defined */
exports.exists = function(x) {
    return (x !== undefined && x !== null);
};