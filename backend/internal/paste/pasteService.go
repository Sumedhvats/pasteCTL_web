package pasteService

import (
	"errors"
	"log"
	"time"

	"github.com/Sumedhvats/pasteCTL/internal/db"
	"github.com/Sumedhvats/pasteCTL/pkg"
	"github.com/jackc/pgx/v5"
)
type PasteService interface {
	CreatePaste(content string, lang string, expireMinutes int) (*db.Paste, error)
	GetPaste(id string) (*db.Paste, error)
	GetContent(id string) (string, error)
	UpdatePaste(id string,content string, lang string)(*db.Paste,error)
	UpdateViews(id string,count int)(*db.Paste,error)
	DeleteExpiredPastes()error

}
var (
    ErrPasteNotFound = errors.New("paste not found")
    ErrPasteExpired  = errors.New("paste has expired")
)
type pasteService struct{
	repo db.Repository
}

func NewPasteService(r db.Repository)PasteService{
	return &pasteService{
		repo:r,
	}
}
func (s *pasteService)CreatePaste(content string, lang string, expireMinutes int) (*db.Paste, error) {
	if content == "" || lang == "" {
		return nil, errors.New("content and language required")
	}

	var expireTime *time.Time
	if expireMinutes != 0 {
		t := time.Now().Add(time.Duration(expireMinutes) * time.Minute)
		expireTime = &t
	}

	for i := 0; i < 5; i++ {
		id :=pkg.GenerateId(5)
		paste := &db.Paste{
			ID:       id,
			Content:  content,
			Language: lang,
			ExpireAt: expireTime,
		}

		err := s.repo.CreatePaste(paste)
		if err == nil {
			return paste, nil
		}

		if err.Error() != "unique constraint violation" {
			return nil, err
		}
		log.Printf("ID collision detected, retrying: %s", id)
	}

	return nil, errors.New("failed to generate a unique ID after 5 attempts")
}


func (s *pasteService) UpdatePaste(id string, content string, lang string) (*db.Paste, error) {
    if content == "" {
        return nil, errors.New("content is required")
    }

    paste := &db.Paste{
        ID:      id,
        Content: content,
    }

    if lang != "" {
        paste.Language = lang
    } else {
        paste.Language = "text" // default language
    }

    err := s.repo.UpdatePaste(paste)
    if err != nil {
        log.Printf("Failed to update paste ID=%s: %v", id, err)
        return nil, err
    }

    return paste, nil
}

func (s *pasteService)UpdateViews(id string,count int)(*db.Paste,error){
	paste:=&db.Paste{
		ID: id,
	}
	err:=s.repo.UpdateViews(paste,count )
	if err!=nil {
		return nil,err
	}
	return paste,nil
}

func(s *pasteService) GetPaste(id string) (*db.Paste, error) {
    paste, err := s.repo.GetPaste(id)
    if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPasteNotFound
		}
		return nil, err // It's some other real DB error
	}
    if paste == nil {
        return nil, ErrPasteNotFound
    }
    if paste.ExpireAt != nil && time.Now().After(*paste.ExpireAt) {
        return nil, ErrPasteExpired
    }
    return paste, nil
}

func (s *pasteService)GetContent(id string)(string,error){
	paste, err := s.repo.GetPaste(id)
	if err != nil {
		return "", err
	}

	if paste.ExpireAt != nil && time.Now().After(*paste.ExpireAt) {
		return "", errors.New("paste has expired")
	}

	return paste.Content, nil
}
func (s *pasteService)DeleteExpiredPastes()error{
	return s.repo.DeleteExpired()
}