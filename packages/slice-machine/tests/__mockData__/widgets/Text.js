export const valid = {
  __pass: true,
  type: "Text",
  config: {
    label: "Title",
    placeholder: "key text"
  }
}

export const wrongType = {
  __pass: false,
  type: "Text2",
  config: {
    label: "Title",
    placeholder: "key text"
  }
}

export const noConfig = {
  __pass: false,
  type: "Text",
}
