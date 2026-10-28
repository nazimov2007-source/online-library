erDiagram
    GENRES {
        integer id PK
        text name
    }
    BOOKS {
        integer id PK
        text title
        text author
        integer price
        integer genre_id FK
    }
    GENRES ||--o{ BOOKS : "содержит"