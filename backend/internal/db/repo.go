package db

import (
	"context"
	"time"
)

type Paste struct {
	ID        string
	Content   string
	Language  string
	CreatedAt time.Time
	ExpireAt  *time.Time
	Views     int
}
type Repository interface {
	CreatePaste(p *Paste) error
	UpdatePaste(p *Paste) error
	UpdateViews(p *Paste, count int) error
	GetPaste(id string) (*Paste, error)
	GetContent(id string) (string, error)
}
type repo struct {
}

func NewRepo() Repository {
	return &repo{}
}
func (r *repo) CreatePaste(p *Paste) error {
	_, err := DB.Exec(context.Background(), "INSERT INTO pastes(id,content,language,expire_at) VALUES($1,$2,$3,$4)", p.ID, p.Content, p.Language, p.ExpireAt)
	return err
}

func (r *repo) UpdatePaste(p *Paste) error {
	_, err := DB.Exec(context.Background(), "UPDATE pastes SET content = $1,Language = $2 WHERE ID = $3", p.Content, p.Language, p.ID)
	return err
}
func (r *repo) UpdateViews(p *Paste, count int) error {
	_, err := DB.Exec(context.Background(), "UPDATE pastes SET views=views+$1 where id=$2 ", count, p.ID)

	return err
}

func (r *repo) GetPaste(ID string) (*Paste, error) {

	row := DB.QueryRow(context.Background(), "SELECT id, content, language, created_at, expire_at, views FROM pastes WHERE id=$1", ID)
	pp := &Paste{}
	err := row.Scan(&pp.ID, &pp.Content, &pp.Language, &pp.CreatedAt, &pp.ExpireAt, &pp.Views)
	if err != nil {
		return nil, err
	}
	return pp, nil
}
func (r *repo) GetContent(ID string) (string, error) {

	row := DB.QueryRow(context.Background(), "SELECT content from pastes WHERE id=$1", ID)
	var st string
	err := row.Scan(&st)
	if err != nil {
		return "", err
	}
	return st, nil
}
