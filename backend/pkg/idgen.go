package pkg
import "math/rand"
const characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func GenerateId(n int)string{
	b:=make([]byte, n)
	for i :=range b{
		b[i]=characters[rand.Intn(len(characters))]
	}
	return string(b)
}