package com.teacher.managerment.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class LarkBaseConfig {

    @Value("${larkbase.app.id}")
    private String appId;

    @Value("${larkbase.app.secret}")
    private String appSecret;

    @Value("${larkbase.base.token}")
    private String baseToken;

    @Value("${larkbase.api.url:https://open.larksuite.com/open-apis}")
    private String apiUrl;

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    // Getters
    public String getAppId() { return appId; }
    public String getAppSecret() { return appSecret; }
    public String getBaseToken() { return baseToken; }
    public String getApiUrl() { return apiUrl; }
}
