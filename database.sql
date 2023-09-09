
CREATE TABLE chats(
    ID SERIAL PRIMARY KEY,
    USERFROM VARCHAR(50) NOT NULL,
    USERTO VARCHAR(50) NOT NULL,
    CHATID VARCHAR(100), 
    MESSAGEID VARCHAR(100),   
    TEXTMSG TEXT,
    IMAGEMSG TEXT[],
    SEEN BOOLEAN,
    DELIVERY: BOOLEAN,
    DATE TEXT,
)