package broker

import (
	"fmt"
	"log"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	MaxRetry   = 2
	Main_DLQ   = "main_dlq"
	Main_Queue = "main_queue"
	Main_DLX   = "main_dlx"
)

func Connect(user, pass, host, port string) (*amqp.Channel, func() error) {
	addr := fmt.Sprintf("amqp://%s:%s@%s:%s", user, pass, host, port)

	conn, err := amqp.Dial(addr)
	if err != nil {
		log.Fatal(err)
	}

	ch, err := conn.Channel()
	if err != nil {
		log.Fatal(err)
	}

	err = ch.ExchangeDeclare(OrderCreated, amqp.ExchangeDirect, true, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = ch.ExchangeDeclare(OrderStatusUpdated, amqp.ExchangeDirect, true, false, false, false, nil)
	if err != nil {
		log.Fatal(err)
	}

	err = createDLQandDLX(ch)
	if err != nil {
		log.Fatal(err)
	}

	return ch, conn.Close
}

// func createQ
type AmqpHeaders map[string]any

func (a AmqpHeaders) GetKey(key string) string {
	value, ok := a[key]
	if !ok {
		return ""
	}

	return value.(string)
}

func (a AmqpHeaders) SetKey(key, value string) {
	a[key] = value
}

func (a AmqpHeaders) GetKeys(key, value string) []string {
	keys := make([]string, len(a))
	index := 0

	for key := range a {
		keys[index] = key
		index++
	}

	return keys
}

func createDLQandDLX(ch *amqp.Channel) error {
	// declaring main q
	q, err := ch.QueueDeclare(Main_Queue, true, false, false, false, nil)
	if err != nil {
		return err
	}

	// declaring DLX
	err = ch.ExchangeDeclare(Main_DLX, "fanout", true, false, false, false, nil)
	if err != nil {
		return err
	}

	// binding main to DLX
	err = ch.QueueBind(q.Name, "", Main_DLX, false, nil)
	if err != nil {
		return err
	}

	// declaring main DLQ
	_, err = ch.QueueDeclare(Main_DLQ, true, false, false, false, nil)
	if err != nil {
		return err
	}

	return nil
}
