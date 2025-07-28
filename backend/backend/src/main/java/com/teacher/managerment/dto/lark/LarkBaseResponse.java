package com.teacher.managerment.dto.lark;

import java.util.List;
import java.util.Map;

public class LarkBaseResponse {
    private int code;
    private String msg;
    private Data data;

    public static class Data {
        private List<Map<String, Object>> records;

        public List<Map<String, Object>> getRecords() {
            return records;
        }

        public void setRecords(List<Map<String, Object>> records) {
            this.records = records;
        }
    }

    // Getters and setters
    public int getCode() {
        return code;
    }

    public void setCode(int code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Data getData() {
        return data;
    }

    public void setData(Data data) {
        this.data = data;
    }
}
