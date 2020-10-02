import Form, { FormFields } from './Form'
import  { BsLink } from 'react-icons/bs'
import {
  createInitialValues,
  createValidationSchema
} from 'lib/forms'

/**
* {
     "type": "Link",
    "config": {
      "label": "link",
      "placeholder": "Could be a link to use case, press article, signup...",
      "allowTargetBlank": true
    }
  }
 */

 /**
  *{
    "type": "Link",
    "config": {
      "select": "document",
      "customtypes": ["homepage"],
      "label": "contentrrrrr",
      "placeholder": "dsfdsfsdf"
    }
  }
  */

  /**{
    "type" : "Link",
    "config" : {
      "select" : "media",
      "label" : "tomedia",
      "placeholder" : "qsdqsdqsd"
    }
  } */


 /** should handle content relationship and media
  * 
  *{
    id: "Xt9fSxEAACIAFHz7"
    type: "homepage"
    tags: []
    slug: "homepage"
    lang: "en-us"
    link_type: "Document"
    isBroken: false
  }
  */

const create = (apiId) => ({
  ...createInitialValues(FormFields),
  allowTargetBlank: true,
  id: apiId
})

const createMock = (maybeMock) =>
  maybeMock || ({ link_type: "Web", url: "https://slicemachine.dev" })

const Meta = {
  icon: BsLink,
  title: 'Link',
  description: 'A link to web, media or Prismic document'
}

export default {
  createMock,
  Meta,
  FormFields,
  Form,
  create

}