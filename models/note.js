const mongooose = require('mongoose');
const Schema = mongooose.Schema;

const noteSchema = new Schema({
    title: {
        type: String
    },
    body: {
        type: String,
        required: true
    },
    lastActivityDate : {
        type: String,
    },
    lastAcitivityTime: {
        type: String
    }
})

const Note = mongooose.model('Note', noteSchema);

module.exports = Note;