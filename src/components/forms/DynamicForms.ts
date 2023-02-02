import React from "react";

interface DynamicFormObject {
    uid: string;
    form: React.ReactNode;
}

class DynamicForms {
    private readonly forms: {[key: string]: DynamicFormObject};

    constructor() {
        this.forms = {};
    }

    register(form: DynamicFormObject) {
        if (typeof this.forms[form.uid] === "undefined") {
            this.forms[form.uid] = form;
            return true
        } else {
            return false;
        }
    }

    unregister(form: DynamicFormObject) {
        if (typeof this.forms[form.uid] === "undefined") {
            return false
        } else {
            delete this.forms[form.uid];
            return true;
        }
    }

    getForm(uid: string) {
        return this.forms[uid] ? this.forms[uid].form : null;
    }
}

export {
    DynamicForms
}