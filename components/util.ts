export const isValidUuid = (id: string | null) => {
    return id && id != undefined && id != "undefined" && id != null && id != "null" && id != "";
}