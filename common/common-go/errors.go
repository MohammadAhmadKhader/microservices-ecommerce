package common

import "errors"

var (
	ErrNoItems = errors.New("at least one item is required.")
)