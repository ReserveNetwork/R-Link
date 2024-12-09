/**
 *  @param {string} location
 *
 *  @returns {object}
 */
export function setLatLng(location) {
    if(location === null || typeof location === "undefined") {
        throw new Error("Location not set");
    }
    const locArr = location.split(",");

    if (locArr.length < 2) return;
    let latitude = Number(locArr[0].trim());
    let longitude = Number(locArr[1].trim());

    return {
        latitude: latitude,
        longitude: longitude
    };
}
