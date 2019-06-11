const { $Message } = require('../dist/base/index');
class Msg {

    handleDefault(msg) {
        $Message({
            content: msg
        });
    };
    handleSuccess(msg) {
        $Message({
            content: msg,
            type: 'success'
        });
    };
    handleWarning(msg) {
        $Message({
            content: msg,
            type: 'warning'
        });
    };
    handleError(msg) {
        $Message({
            content: msg,
            type: 'error'
        });
    }
    handleDuration(msg) {
        $Message({
            content: msg,
            duration: 5
        });
    };
}
export {
    Msg
}