// @flow
import React, { Component, Fragment } from 'react'
import MouseTrap from 'mousetrap'
import { LetterContainer, Letter, OptionLetter, CurrentLetter, CorrectLetter } from './styled'
import { generateWordBuilderGame } from './helpers'
import Answer from 'components/Answer'
import { WidgetBody, WidgetFooter } from 'components/Generic'
import { charKeys, equalWithoutAccents } from 'common/utils'
import type { IWord } from 'common/types'
import SoundButton from 'components/SoundButton'

type IProps = {|
  getNextWord: boolean => void,
  word: IWord,
|}

type IState = {|
  done: boolean,
  visibleCharCount: number,
  options: string[],
  answered: string[],
|}

export default class WordBuilderGame extends Component<IProps, IState> {
  constructor(props: IProps) {
    super(props)
    const {
      options,
      visibleOptions,
      visibleCharCount,
    } = generateWordBuilderGame(this.props.word.title)
    this.state = {
      answered: visibleOptions,
      visibleCharCount,
      options,
      done: false,
    }
  }

  componentDidMount() {
    MouseTrap.bind(charKeys, this.onKeyPressed)
    MouseTrap.bind('enter', () => this.checkResult(true))
    MouseTrap.bind('backspace', this.undoChange)
  }

  componentWillUnmount() {
    MouseTrap.reset()
  }

  checkResult(isForce: boolean = false) {
    if (this.state.done) {
      this.props.getNextWord(this.isCorrect())
    } else if (isForce || this.isCorrect()) {
      this.setState({ ...this.state, done: true })
    }
  }

  isCorrect = () => equalWithoutAccents(this.state.answered.join(''), this.props.word.title)

  onKeyPressed = (event: SyntheticKeyboardEvent<any>) => {
    if (!this.state.done && this.state.answered.length < this.props.word.title.length) {
      if (event.keyCode >= 97 || event.keyCode <= 122 || event.keyCode === 32) {
        const char = String.fromCharCode(event.keyCode).toLowerCase()
        const index = this.state.options.indexOf(char)
        this.appendOptionAtIndex(index)
      }
    }
  }

  undoChange = () => {
    if (!this.state.done && this.state.answered.length > this.state.visibleCharCount) {
      const deleted = this.state.answered.pop()
      this.state.options.push(deleted)
      this.setState(this.state)
    }
  }

  appendOptionAtIndex(index: number) {
    if (index !== -1) {
      const deleted = this.state.options.splice(index, 1)
      this.state.answered.push(deleted[0])
      this.setState(this.state)
      this.checkResult()
    }
  }

  onOptionClicked = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const index = event.target.dataset.index
    this.appendOptionAtIndex(index)
  }

  onAnsweredClicked = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const index = event.target.dataset.index
    if (index >= this.state.visibleCharCount) {
      const deleted = this.state.answered.splice(index, 1)
      this.state.options.push(deleted[0])
      this.setState(this.state)
    }
  }

  getAnswer = () =>
    this.state.answered.length > this.state.visibleCharCount
      ? this.state.answered.join('')
      : ''

  render() {
    return (
      <Fragment>
        <WidgetBody>
          <h1 className="text-center">{this.props.word.definition}</h1>
          {
            this.state.done ? (
              <div className="text-center">
                <SoundButton audioUrl={this.props.word.audioUrl} autoplay visible={false} />
                <Answer
                  correct={this.props.word.title}
                  given={this.getAnswer()}
                />
              </div>
            ) : (
              <Fragment>
                <LetterContainer>
                  {
                    this.state.answered.map((value, index) => (
                      <CorrectLetter
                        key={index}
                        data-index={index}
                        onClick={this.onAnsweredClicked}
                      >
                        {value}
                      </CorrectLetter>
                    ))
                  }
                  {
                    [
                      ...Array(this.props.word.title.length - this.state.answered.length),
                    ].map(
                      (_, index) => index === 0
                        ? <CurrentLetter key={index} />
                        : <Letter key={index} />,
                    )
                  }
                </LetterContainer>
                <LetterContainer>
                  {
                    this.state.options.map((value, index) => (
                      <OptionLetter
                        key={index}
                        data-index={index}
                        onClick={this.onOptionClicked}
                      >
                        {value}
                      </OptionLetter>
                    ))
                  }
                </LetterContainer>
              </Fragment>
            )
          }
        </WidgetBody>
        <WidgetFooter>
          <button className="btn btn-primary" onClick={() => this.checkResult(true)}>
            {this.state.done ? 'Continue' : 'Check answer'}
          </button>
        </WidgetFooter>
      </Fragment>
    )
  }
}
