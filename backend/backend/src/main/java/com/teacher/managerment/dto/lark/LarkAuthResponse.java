package com.teacher.managerment.dto.lark;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LarkAuthResponse {
    private int code;
    private String msg;

    @JsonProperty("app_access_token")
    private String appAccessToken;

    @JsonProperty("tenant_access_token")
    private String tenantAccessToken;

    private int expire;

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

    public String getAppAccessToken() {
        return appAccessToken;
    }

    public void setAppAccessToken(String appAccessToken) {
        this.appAccessToken = appAccessToken;
    }

    public String getTenantAccessToken() {
        return tenantAccessToken;
    }

    public void setTenantAccessToken(String tenantAccessToken) {
        this.tenantAccessToken = tenantAccessToken;
    }

    public int getExpire() {
        return expire;
    }

    public void setExpire(int expire) {
        this.expire = expire;
    }
}
