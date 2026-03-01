package com.cmms.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "memo_comment")
@IdClass(MemoCommentId.class)
public class MemoComment {

    @Id
    @Column(name = "company_id", length = 20, nullable = false)
    private String companyId;

    @Id
    @Column(name = "memo_id", length = 20, nullable = false)
    private String memoId;

    @Id
    @Column(name = "comment_id", nullable = false)
    private Integer commentId;

    @Column(name = "author_id", length = 20)
    private String authorId;

    @Column(name = "date", insertable = false, updatable = false, columnDefinition = "TIMESTAMP")
    private LocalDateTime date;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
}
