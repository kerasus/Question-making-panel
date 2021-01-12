import { Model, Collection } from 'js-abstract-model'
import {QuestionList} from './Question';
import {QuestCategoryList} from "@/models/QuestCategory";
import {QuestSubcategoryList} from '@/models/QuestSubcategory';
import { CheckingTimeList } from "@/models/CheckingTime";

class Quiz extends Model {
    constructor (data) {
        super(data, [
            {
                key: 'baseRoute',
                default: '/api/3a/exam'
            },
            { key: 'holding_status' },
            { key: 'photo' },
            { key: 'price' },
            { key: 'delay_time' },

            { key: 'id' },
            { key: 'title' },
            { key: 'order' },
            { key: 'start_at' },
            { key: 'finish_at' },
            { key: 'total_question_number' },
            {
                key: 'questions',
                relatedModel: QuestionList
            },
            {
                key: 'categories',
                relatedModel: QuestCategoryList
            },
            {
                key: 'sub_categories',
                relatedModel: QuestSubcategoryList
            },
        ])

        this.questions.sortByOrder()
        this.categories.sortByKey('end_at', 'asc')
    }

    loadSubcategoriesOfCategories() {
        const subcategoryList = this.sub_categories
        this.categories.list.map((item) => {
            item.getSubcategories(subcategoryList)
        })
    }

    getQuestionsHasData () {
        return this.questions.list.filter(
            (item) => {
                const selected = item.choices.getSelected()
                const bookmarked = item.bookmarked
                const state = item.state
                const checkingTimesLength = item.checking_times.list.length

                return (selected || bookmarked || state || checkingTimesLength)
            }
        )
    }

    setUserQuizData (userData) {
        if (!userData) {
            return
        }
        this.questions.list.map((question)=> {
            let userQuestionData = userData.find((questionData)=> questionData.questionId === question.id)
            if (userQuestionData) {
                // load choice
                question.uncheckChoices()
                question.selectChoice(userQuestionData.choicesId)

                question.checking_times = new CheckingTimeList(userQuestionData.checking_times.list)
                question.bookmarked = userQuestionData.bookmarked
                question.state = userQuestionData.state
            }
        })
    }

    mergeUserQuizData (userQuizData) {
        let questionsHasData = this.getQuestionsHasData()
        console.log('questions with data', questionsHasData.length)

        questionsHasData.forEach((question) => {
            if (!userQuizData) {
                userQuizData = []
                this.addUserQuestionData(question, userQuizData)


            } else {
                let userQuestionData = userQuizData.find((questionData)=> questionData.questionId === question.id)
                if (!userQuestionData) {
                    this.addUserQuestionData(question, userQuizData)
                } else {
                    this.loadUserQuestionData(question, userQuestionData)
                }
            }
        });
        console.log('ADD', userQuizData)
        return userQuizData
    }

    addUserQuestionDataCheckingTimes (question, checkingTimes) {
        if (!checkingTimes) {
            return
        }

        question.checking_times.list.forEach((checkingTime)=> {
            const oldCheckingTimeIndex = checkingTimes.findIndex((item) => item.start === checkingTime.start && item.end === null && checkingTime.end !== null)
            if (oldCheckingTimeIndex !== -1) {
                checkingTimes.splice(oldCheckingTimeIndex, 1)
            }
            checkingTimes.push({
                start: checkingTime.start,
                end: checkingTime.end
            })
        })
        console.log('checking times: ', checkingTimes)
    }

    loadCheckingTimesFromUserData (question, userQuizData) {
        const userQuestionData = userQuizData.find((questionData) => questionData.questionId === question.id)
        if (userQuestionData) {
            question.checking_times = new CheckingTimeList(userQuestionData.checking_times)
        }
        console.log('userQuestionData: ', userQuestionData)
    }

    loadUserQuestionData (question, userQuestionData) {
        let answeredChoice = question.getAnsweredChoice()
        userQuestionData.choicesId = null
        if (answeredChoice) {
            userQuestionData.choicesId = answeredChoice.id
        }

        this.addUserQuestionDataCheckingTimes (question, userQuestionData.checking_times)

        userQuestionData.bookmarked = question.bookmarked
        userQuestionData.state = question.state
    }

    addUserQuestionData (question, userQuizData) {
        let answeredChoice = question.getAnsweredChoice()
        let answeredChoiceId = null
        if (answeredChoice) {
            answeredChoiceId = answeredChoice.id
        }
        let checkingTimes = []
        this.addUserQuestionDataCheckingTimes (question, checkingTimes)

        userQuizData.push({
            questionId: question.id,
            checking_times: checkingTimes,
            bookmarked: question.bookmarked,
            state: question.state,
            choicesId: answeredChoiceId
        })
    }

    // getCategoryFromSubCategory (subCategoryId) {
    //     const categoryId = this.sub_categories.list.find((item) => { item.id })
    // }
}

class QuizList extends Collection {
    model () {
        return Quiz
    }
}

export { Quiz, QuizList }
