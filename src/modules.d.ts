import * as _ from 'lodash'

declare module 'lodash' {
    interface LoDashStatic {
        fake(): boolean
    }
}
