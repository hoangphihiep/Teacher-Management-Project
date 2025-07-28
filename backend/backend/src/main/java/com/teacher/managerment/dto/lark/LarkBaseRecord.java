package com.teacher.managerment.dto.lark;

import java.util.Map;

public class LarkBaseRecord {
    private Map<String, Object> fields;

    public LarkBaseRecord() {}

    public LarkBaseRecord(Map<String, Object> fields) {
        this.fields = fields;
    }

    public Map<String, Object> getFields() {
        return fields;
    }

    public void setFields(Map<String, Object> fields) {
        this.fields = fields;
    }
}
