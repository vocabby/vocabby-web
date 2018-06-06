// @flow
import { dispatch } from '@rematch/core'
import type { IVocabEffects } from './types'
import { getVocab } from 'common/api'

const effects: IVocabEffects = {
  async loadAsync(slug: string) {
    dispatch.vocab.loading()
    const vocab = await getVocab(slug)
    dispatch.vocab.loaded({ vocab })
  },
}

export default effects
