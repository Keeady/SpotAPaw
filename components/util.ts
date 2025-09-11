export const isValidUuid = (id: string) => {
    return id && id != undefined && id != null && id != "null" && id != "";
}