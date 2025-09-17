package service

import (
	"errors"
	"time"

	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/google/uuid"
)

func CreatePaste (content string, lang string, expireMinutes int)(*db.Paste,error){
if content == "" ||  lang== "" {
		return nil, errors.New("content and language required")
	}
	id:= uuid.New()
	var expireTime time.Time
	if expireMinutes>0{
		expireTime=time.Now().Add(time.Duration(expireMinutes)*time.Minute)
	}
	paste:=&db.Paste{
		ID: id.String(),
		Content: content,
		Language: lang,
		ExpireAt: &expireTime,
	}
	err:=db.CreatePaste(paste)
	if err!=nil {
		return nil,err
	}
	return paste,nil
}
func UpdatePaste(id string,content string, lang string)(*db.Paste,error){
if content == "" ||  lang== "" {
		return nil, errors.New("content and language required")
	}
	paste:=&db.Paste{
		ID:id,
		Content: content,
		Language: lang,
	}
	err:=db.UpdatePaste(paste)
	if err!=nil {
		return nil,err
	}
	return paste,nil
}
func UpdateViews(id string,count int)(*db.Paste,error){
	paste:=&db.Paste{
		ID: id,
	}
	err:=db.UpdateViews(paste,count )
	if err!=nil {
		return nil,err
	}
	return paste,nil
}
func GetPaste(id string)(*db.Paste,error){
return  db.GetPaste(id)
}
func GetContent(id string)(string,error){
	return db.GetContent(id)
}