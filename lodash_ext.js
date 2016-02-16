module.exports.getNestedValue = function(object, properties, defaultValue) {
    if (object === undefined || object === null) {
        return defaultValue;
    }

    if (properties.length === 0) {
        return object;
    }

    var foundSoFar = object[properties[0]];
    var remainingProperties = properties.slice(1);

    return this.getNestedValue(foundSoFar, remainingProperties, defaultValue);
}
