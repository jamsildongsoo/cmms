package com.cmms.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CalendarEventDto {
    private String id;
    private String type; // PM, WO, WP
    private String title;
    private String start; // ISO string
    private String end; // ISO string
    private String color;
    private String status;
    private String url;
}
