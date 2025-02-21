// mcumgr.js

smpEcho(message) {
    return this._sendMessage(MGMT_OP_WRITE, MGMT_GROUP_ID_SHELL, 0, { argv: ["diag","led","on"] });
}

// index.js
mcumgr.onMessage(({ op, group, id, data, length }) => {
    switch (group) {
        case MGMT_GROUP_ID_OS:
            switch (id) {
                case OS_MGMT_ID_ECHO:
                    alert(data.r);
                    break;
                case OS_MGMT_ID_TASKSTAT:
                    console.table(data.tasks);
                    break;
                case OS_MGMT_ID_MPSTAT:
                    console.log(data);
                    break;
                    break;
        case MGMT_GROUP_ID_SHELL:
            alert(data.o);
            break;
            }